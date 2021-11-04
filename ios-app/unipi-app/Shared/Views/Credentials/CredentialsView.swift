import SwiftUI
import API

struct CredentialsView: View {
    @ObservedObject var viewModel: CredentialsViewModel = CredentialsViewModel()

    @State var accessToken: String? = nil
    @State var currentError: AlertData?
    @State var isLoading: Bool = false
    @State var errorData: AlertData?

    @State private var usr: String = ""
    @State private var pwd: String = ""

    let keychain = Keychain()
    
    var body: some View {
        if let _ = self.accessToken {
            CareersView()
        } else {
            Form {
                TextField("user", text: $usr)
                SecureField("password", text: $pwd)
                Button("login") {
                }.progressView(when: isLoading)
                .onTapGesture(perform: {
                    viewModel.getAuthToken(usr: self.usr, pwd: self.pwd)
                })
            }.alert(item: $errorData, content: { data in
                Alert(title: .init(data.title),
                      message: .init(data.message),
                      dismissButton: .default(.init("ok")))
            }).onReceive(viewModel.state,
                         perform: { state in updateState(state) })
            .navigationTitle("type your credentials")
        }
    }
}

private extension CredentialsView {
    private func updateState(_ state: CredentialsView.ViewState) {
        switch state {
        case .idle:
            idle()
        case .loading:
            loading()
        case let .loggedId(accessToken: accessToken):
            loggedId(accessToken: accessToken)
        case let .fail(error: error):
            fail(error: error)
        }
    }

    private func idle() {
        self.isLoading = false
    }

    private func loading() {
        self.isLoading = true
    }

    private func loggedId(accessToken: String) {
        self.accessToken = accessToken
        self.currentError = nil
        self.isLoading = false
    }

    private func fail(error: Error) {
        self.currentError = AlertData(id: error.stringValue,
                                      title: "error",
                                      message: error.stringValue)
        self.isLoading = false
    }
}
