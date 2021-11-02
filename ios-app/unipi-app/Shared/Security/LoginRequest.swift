import Foundation
import API

let buildRequest: (String) -> (String) -> API.AuthOp.Request = {
    u in {
        p in
        let body = API.AuthOp.Request.Body(usr: u, pwd: p)
        let options = API.AuthOp.Request.Options(usr: u, pwd: p)
        return API.AuthOp.Request(body: body, options: options)
    }
}

let getResult: (APIResponse<API.AuthOp.Response>) -> Result<String, Error> = {
    response in
    switch response.result {
    case let .success(v):
        switch v {
        case let .status200(token):
            if let t = token.accessToken {
                return .success(t)
            }
            return .failure(NetError.missingAccessToken)
        default:
            return .failure(NetError.unexpectedStatusCode(v.statusCode))
        }
    case let .failure(e):
        return .failure(NetError.serverError("user authentication failed with error '\(e)'"))
    }
}

public func makeLoginRequest(client: APIClient, complete: @escaping (Result<String, Error>) -> Void) -> (String, String) -> Void {
    { (usr, pwd) in
        client.makeRequest(buildRequest(usr)(pwd)) {
            response in complete(getResult(response))
        }
    }
}

public func saveCredentials(_ keychain: Keychain) -> (String, String, String) -> Void {
    {
        (tkn, usr, pwd) in
        keychain.accessToken = tkn
        keychain.usr = usr
        keychain.pwd = pwd
    }
}
