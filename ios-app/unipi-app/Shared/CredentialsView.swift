import SwiftUI
import API

struct CredentialsView: View {
    @State private var usr: String = ""
    @State private var pwd: String = ""
    let apiClient = APIClient(baseURL: "https://unipi-api.herokuapp.com")

    var body: some View {
        VStack {
            TextField("user", text: $usr)
            SecureField("password", text: $pwd)
        }
    }
}
