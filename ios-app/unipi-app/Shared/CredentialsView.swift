import SwiftUI
import API

struct CredentialsView: View {
    let facultyId: String

    let apiClient = APIClient(baseURL: "https://unipi-api.herokuapp.com")

    @State private var usr: String = ""
    @State private var pwd: String = ""

    @State var accessToken: String = ""
    @State var currentError: Error?

    let getResult: (APIResponse<API.AuthOp.Response>) -> Result<String, Error> = {
        response in
        switch response.result {
        case let .success(v):
            switch v {
            case let .status200(token):
                if let t = token.accessToken {
                    return .success(t)
                }
                return .failure(NetError.missingAccessToken)
            default:
                return .failure(NetError.unexpectedStatusCode(v.statusCode))
            }
        case let .failure(e):
            return .failure(NetError.serverError("user authentication failed with error '\(e)'"))
        }
    }

    // HACK: by using API.AuthOp.Request's convenience constructor
    //       its body get a nil value.
    let buildRequest: (String) -> (String) -> API.AuthOp.Request = {
        u in {
            p in
            let body = API.AuthOp.Request.Body(usr: u, pwd: p)
            let options = API.AuthOp.Request.Options(usr: u, pwd: p)
            return API.AuthOp.Request(body: body, options: options)
        }
    }

    var body: some View {
        NavigationView {
            Form {
                TextField("user", text: $usr)
                SecureField("password", text: $pwd)
                Button("login") {
                }.onTapGesture(perform: {
                    apiClient.makeRequest(buildRequest(self.usr)(self.pwd)) {
                        response in
                        switch getResult(response) {
                        case .success(let token):
                            self.accessToken = token
                        case .failure(let error):
                            self.currentError = error
                        }
                    }
                })
            }.onAppear(perform: {
                UserDefaults.standard.set(facultyId, forKey: "facultyId")
            }).navigationTitle("type your credentials")
            if let error = currentError {
                Text("\(error)" as String) // TODO: this text is not displayed :-/
            }
        }
    }
}
