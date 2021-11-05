import Foundation
import API

class BookletViewModel: ObservableObject {
    let apiClient = APIClient(baseURL: "https://unipi-api.herokuapp.com")

    @Published private(set) var privateState: BookletView.ViewState = .idle
    var state: Published<BookletView.ViewState>.Publisher { $privateState }

    let keychain = Keychain()

    let getResult: (APIResponse<API.BookletOp.Response>) -> Result<API.BookletOp.Response.Status200, Error> = {
        response in
        switch response.result {
        case let .success(v):
            switch v {
            case let .status200(booklet):
                return .success(booklet)
            default:
                return .failure(NetError.unexpectedStatusCode(v.statusCode))
            }
        case let .failure(e):
            return .failure(NetError.serverError("retrieving booklet failed with error '\(e)'"))
        }
    }

    func getBooklet(token: String, careerId: Int) {
        self.privateState = .loading
        apiClient.makeRequest(
            API.BookletOp.Request(options: API.BookletOp.Request.Options(careerId: careerId)),
            behaviours: [BearerTokenRequestBehaviour(token: token)]
        ) { [weak self] response in
            guard let self = self else { return }
            switch self.getResult(response) {
            case .success(let data):
                self.privateState = .content(data: data)
            case .failure(let error):
                // TODO: check if token is expired and renew it
                self.privateState = .fail(error: error)
            }
        }
    }
}

extension BookletView {
    enum ViewState {
        case idle
        case loading
        case content(data: API.BookletOp.Response.Status200)
        case fail(error: Error)
    }
}
