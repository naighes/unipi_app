import SwiftUI

@main
struct unipi_appApp: App {
    let keychain = Keychain()

    init() {
        // HACK/TODO: reset keychain on startup
        self.keychain.accessToken = nil
        self.keychain.usr = nil
        self.keychain.pwd = nil
    }

    var body: some Scene {
        WindowGroup {
            NavigationView {
                CredentialsView()
            }
            .navigationViewStyle(StackNavigationViewStyle())
        }
    }
}
