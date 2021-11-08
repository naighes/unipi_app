import Foundation
import API

class PlanViewModel: ObservableObject {
    let apiClient = APIClient(baseURL: "https://unipi-api.herokuapp.com")

    @Published private(set) var privateState: PlanView.ViewState = .idle
    var state: Published<PlanView.ViewState>.Publisher { $privateState }

    let keychain = Keychain()

    let getResult: (APIResponse<API.PlanOp.Response>) -> Result<API.PlanOp.Response.Status200, Error> = {
        response in
        switch response.result {
        case let .success(v):
            switch v {
            case let .status200(plan):
                return .success(plan)
            default:
                return .failure(NetError.unexpectedStatusCode(v.statusCode))
            }
        case let .failure(e):
            return .failure(NetError.serverError("retrieving plan failed with error '\(e)'"))
        }
    }

    func getPlan(token: String, careerId: Int) {
        self.privateState = .loading
        apiClient.makeRequest(
            API.PlanOp.Request(options: API.PlanOp.Request.Options(careerId: careerId)),
            behaviours: [BearerTokenRequestBehaviour(token: token)]
        ) { [weak self] response in
            guard let self = self else { return }
            switch self.getResult(response) {
            case .success(let data):
                self.privateState = .content(data: data)
            case .failure(let error):
                // TODO: check if token is expired and renew it
                self.privateState = .fail(error: error)
            }
        }
    }
}

extension PlanView {
    enum ViewState {
        case idle
        case loading
        case content(data: API.PlanOp.Response.Status200)
        case fail(error: Error)
    }
}