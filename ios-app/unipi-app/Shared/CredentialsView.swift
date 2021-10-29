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

    var body: some View {
        NavigationView {
            Form {
                TextField("user", text: $usr)
                SecureField("password", text: $pwd)
                Button("login") {
                }.onTapGesture(perform: {
                    apiClient.makeRequest(API.AuthOp.Request(usr: self.usr, pwd: self.pwd)) {
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
