import Foundation
import KeychainStored

public class Keychain {
    @KeychainStored(service: "com.naighes.unipi-app.accessToken") var accessToken: String?
    @KeychainStored(service: "com.naighes.unipi-app.usr") var usr: String?
    @KeychainStored(service: "com.naighes.unipi-app.pwd") var pwd: String?
}
