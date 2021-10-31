import Foundation
import KeychainStored

class Keychain {
    @KeychainStored(service: "com.baldin.unipi-app") var accessToken: String?
}
