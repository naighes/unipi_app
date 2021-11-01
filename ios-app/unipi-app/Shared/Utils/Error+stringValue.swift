import Foundation

extension Error {
    var stringValue: String {
        (self as? NetError)?.stringValue ?? localizedDescription
    }
}
