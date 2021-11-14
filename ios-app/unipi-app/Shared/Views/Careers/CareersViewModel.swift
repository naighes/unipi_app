import Foundation
import API

class CareersViewModel: ObservableObject {
    let apiClient = APIClient(baseURL: "https://unipi-api.herokuapp.com")
    let keychain = Keychain()
    
    @Published var data: [Career] = []
    @Published var currentError: AlertData?
    @Published var isLoading: Bool = false
    @Published var careerId: Int? = nil

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
        isLoading = true
        apiClient.makeRequest(
            API.CareersOp.Request(),
            behaviours: [BearerTokenRequestBehaviour(token: token)]
        ) { [weak self] response in
            guard let self = self else { return }
            self.isLoading = false
            switch self.getResult(response) {
            case .success(let data):                
                self.data = data.entries?.map(Career.init) ?? []
            case .failure(let error):
                // TODO: check if token is expired and renew it
                self.currentError = AlertData(id: error.stringValue,
                                              title: "error",
                                              message: error.stringValue)
            }
        }
    }
}

extension Career {
    init(_ entry: API.CareersOp.Response.Status200.Entries) {
        self.init(name: entry.name ?? "[unknown]",
                  identifier: entry.careerId ?? 0,
                  type: entry.type ?? "[unknown]")
    }
}
