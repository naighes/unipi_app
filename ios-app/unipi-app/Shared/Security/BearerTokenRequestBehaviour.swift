import Foundation
import API

struct BearerTokenRequestBehaviour: RequestBehaviour {
    let token: String

    func modifyRequest(request: AnyRequest, urlRequest: URLRequest) -> URLRequest {
        var mr = urlRequest
        mr.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        return mr
    }
}
