import SwiftUI

@main
struct unipi_appApp: App {
    init() {
//        deleteKeychain()
    }
    let keychain = Keychain()

//    func deleteKeychain() {
//        let secItemClasses = [kSecClassGenericPassword, kSecClassInternetPassword, kSecClassCertificate, kSecClassKey, kSecClassIdentity]
//        for itemClass in secItemClasses {
//            let spec: NSDictionary = [kSecClass: itemClass]
//            SecItemDelete(spec)
//        }
//    }

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
