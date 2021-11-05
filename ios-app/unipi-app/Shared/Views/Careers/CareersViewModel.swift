import Foundation
import API

class CareersViewModel: ObservableObject {
    let apiClient = APIClient(baseURL: "https://unipi-api.herokuapp.com")

    @Published private(set) var privateState: CareersView.ViewState = .loading
    var state: Published<CareersView.ViewState>.Publisher { $privateState }

    let keychain = Keychain()

    let getResult: (APIResponse<API.CareersOp.Response>) -> Result<API.CareersOp.Response.Status200, Error> = {
        response in
        switch response.result {
        case let .success(v):
            switch v {
            case let .status200(careers):
                return .success(careers)
            default:
                return .failure(NetError.unexpectedStatusCode(v.statusCode))
            }
        case let .failure(e):
            return .failure(NetError.serverError("retrieving careers failed with error '\(e)'"))
        }
    }

    func getCareers(token: String) {
        apiClient.makeRequest(
            API.CareersOp.Request(),
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

extension CareersView {
    enum ViewState {
        case loading
        case content(data: API.CareersOp.Response.Status200)
        case fail(error: Error)
        case careerSelection(careerId: Int, data: API.CareersOp.Response.Status200)
    }
}
