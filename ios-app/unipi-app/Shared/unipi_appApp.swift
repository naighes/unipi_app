import SwiftUI

@main
struct unipi_appApp: App {
    let keychain = Keychain()

    var body: some Scene {
        WindowGroup {
            if let _ = keychain.usr, let _ = keychain.pwd {
                CareersView()
            } else {
                CredentialsView()
            }
        }
    }
}
