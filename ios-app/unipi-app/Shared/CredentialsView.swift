import SwiftUI
import API

struct CredentialsView: View {
    let facultyId: String

    let apiClient = APIClient(baseURL: "https://unipi-api.herokuapp.com")

    @State private var usr: String = ""
    @State private var pwd: String = ""

    @State var accessToken: String = ""

    let getResult: (APIResponse<API.AuthOp.Response>) -> String = {
        response in
        switch response.result {
        case let .success(v):
            switch v {
            case let .status200(token):
                return token.accessToken ?? ""
            default:
                print("unexpected status code")
                return ""
            }
        case let .failure(e):
            print("could not authenticate user: '\(e)'")
            return ""
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
                        accessToken = getResult(response)
                        print(accessToken)
                    }
                })
            }.onAppear(perform: {
                UserDefaults.standard.set(facultyId, forKey: "facultyId")
            }).navigationTitle("type your credentials")
        }
    }
}
