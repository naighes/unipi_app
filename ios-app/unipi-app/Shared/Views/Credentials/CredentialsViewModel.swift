import Foundation
import API

class CredentialsViewModel: ObservableObject {
    let apiClient = APIClient(baseURL: "https://unipi-api.herokuapp.com")

    @Published private(set) var privateState: CredentialsView.ViewState = .idle
    var state: Published<CredentialsView.ViewState>.Publisher { $privateState }

    let keychain = Keychain()

    let getResult: (APIResponse<API.AuthOp.Response>) -> Result<API.AuthOp.Response.Status200, Error> = {
        response in
        switch response.result {
        case let .success(v):
            switch v {
            case let .status200(token):
                return .success(token)
            default:
                return .failure(NetError.unexpectedStatusCode(v.statusCode))
            }
        case let .failure(e):
            return .failure(NetError.serverError("retrieving authentication token failed with error '\(e)'"))
        }
    }

    func getAuthToken(usr: String, pwd: String) {
        self.privateState = .loading
        makeLoginRequest(client: self.apiClient) {
            result in
            switch result {
            case .success(let accessToken):
                saveCredentials(self.keychain)(
                    accessToken,
                    usr,
                    pwd
                )
                self.privateState = .loggedId(accessToken: accessToken)
            case .failure(let e):
                self.privateState = .fail(error: e)
            }
        }(usr, pwd)
    }
}

extension CredentialsView {
    enum ViewState {
        case idle
        case loading
        case loggedId(accessToken: String)
        case fail(error: Error)
    }
}
