import Foundation
import API

class PlanViewModel: ObservableObject {
    let apiClient = APIClient(baseURL: "https://unipi-api.herokuapp.com")
    let keychain = Keychain()
    
    @Published var data: [Plan] = []
    @Published var currentError: AlertData?
    @Published var isLoading: Bool = false
    
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
        isLoading = true
        apiClient.makeRequest(
            API.PlanOp.Request(options: API.PlanOp.Request.Options(careerId: careerId)),
            behaviours: [BearerTokenRequestBehaviour(token: token)]
        ) { [weak self] response in
            guard let self = self else { return }
            self.isLoading = false
            switch self.getResult(response) {
            case .success(let data):
                self.data = data.entries?.map(Plan.init) ?? []
            case .failure(let error):
                // TODO: check if token is expired and renew it
                self.currentError = AlertData(error: error)
            }
        }
    }
}

private extension Plan {
    init(_ entry: API.PlanOp.Response.Status200.Entries) {
        self.init(name: entry.name ?? "[unknown]",
                  entries: entry.planEntries?.map(PlanEntry.init) ?? [])
    }
}

private extension PlanEntry {
    init(_ entry: API.PlanOp.Response.Status200.Entries.PlanEntries) {
        self.init(code: entry.code ?? "[no code]",
                  name: entry.name ?? "[unknown]")
    }
}
