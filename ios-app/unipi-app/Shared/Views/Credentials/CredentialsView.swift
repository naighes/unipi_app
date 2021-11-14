import SwiftUI

struct CredentialsView: View {
    @StateObject var viewModel: CredentialsViewModel = CredentialsViewModel()
        
    var body: some View {
        ZStack {
            CredentialViewForm(viewModel: viewModel)
            CredentialViewNavigation(isActive: $viewModel.isNavigationActive)
            LoaderView(isLoading: viewModel.isLoading)
        }
        .alert(item: $viewModel.errorData,
               content: { Alert(data: $0) })
        .navigationTitle("type your credentials")
    }
}

struct CredentialViewForm: View {
    let viewModel: CredentialsViewModel
    
    @State private var usr: String = ""
    @State private var pwd: String = ""
    
    var body: some View {
        Form {
            TextField("user", text: $usr)
            SecureField("password", text: $pwd)
            Button("login") { viewModel.getAuthToken(usr: self.usr, pwd: self.pwd) }
        }
    }
}

struct CredentialViewNavigation: View {
    @Binding var isActive: Bool
    
    var body: some View {
        NavigationLink(destination: CareersView(),
                       isActive: $isActive,
                       label: { EmptyView() })
    }
}
