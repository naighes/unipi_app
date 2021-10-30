import Foundation

public enum NetError: Error {
    case unexpectedStatusCode(Int)
    case serverError(String)
    case missingAccessToken
}
