import Foundation
import API

class CredentialsViewModel: ObservableObject {
    let apiClient = APIClient(baseURL: "https://unipi-api.herokuapp.com")
    let keychain = Keychain()
    
    @Published var errorData: AlertData?
    @Published var isLoading: Bool = false
    @Published var isNavigationActive: Bool = false

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
        isLoading = true
        makeLoginRequest(client: self.apiClient) { [weak self] result in
            guard let self = self else { return }
            switch result {
            case .success(let accessToken):
                saveCredentials(self.keychain)(
                    accessToken,
                    usr,
                    pwd
                )
                self.isLoading = false
                self.isNavigationActive = true
                
            case .failure(let e):
                self.isLoading = false
                self.errorData = AlertData(error: e)
            }
        }(usr, pwd)
    }
}
