import SwiftUI
import API

struct CredentialsView: View {
    let apiClient = APIClient(baseURL: "https://unipi-api.herokuapp.com")
    let keychain = Keychain()
    
    @State private var usr: String = ""
    @State private var pwd: String = ""
    
    @State var accessToken: String? = nil
    @State var errorData: AlertData?
    
    var body: some View {
        if let _ = self.accessToken {
            CareersView()
        } else {
            Form {
                TextField("user", text: $usr)
                SecureField("password", text: $pwd)
                Button("login") {
                }.onTapGesture(perform: {
                    makeLoginRequest(client: apiClient) {
                        result in
                        switch result {
                        case .success(let token):
                            saveCredentials(self.keychain)(token, self.usr, self.pwd)
                            self.accessToken = token
                        case .failure(let error):
                            self.errorData = .init(id: error.stringValue,
                                                   title: "error",
                                                   message: error.stringValue)
                        }
                    }(self.usr, self.pwd)
                })
            }.alert(item: $errorData, content: { data in
                Alert(title: .init(data.title),
                      message: .init(data.message),
                      dismissButton: .default(.init("Ok")))
            }).navigationTitle("type your credentials")
        }
    }
}
