import Foundation

public enum NetError: Error {
    case unexpectedStatusCode(Int)
    case serverError(String)
    case missingAccessToken
}

extension NetError {
    var stringValue: String {
        switch self {
        case .serverError(let message):
            return message
        case .missingAccessToken:
            return "missing access token"
        case .unexpectedStatusCode(let statusCode):
            return "retrieved unexpected status code: \(statusCode)"
        }
    }
}
