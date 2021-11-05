import Foundation
import API

class FacultiesViewModel: ObservableObject {
    let apiClient = APIClient(baseURL: "https://unipi-api.herokuapp.com")
    let userDefaults = UserDefaults.standard

    @Published private(set) var privateState: FacultiesView.ViewState = .loading
    var state: Published<FacultiesView.ViewState>.Publisher { $privateState }

    let getResult: (APIResponse<API.PathsOp.Response>) -> Result<[(String, String)], Error> = {
        response in
        switch response.result {
        case let .success(v):
            switch v {
            case let .status200(paths):
                return .success(paths.reduce([], { $0 + [($1.key, $1.value)] }).sorted {
                    $0.1 < $1.1
                })
            default:
                return .failure(NetError.unexpectedStatusCode(v.statusCode))
            }
        case let .failure(e):
            return .failure(NetError.serverError("retrieving paths failed with error '\(e)'"))
        }
    }

    func getFaculties() {
        apiClient.makeRequest(API.PathsOp.Request()) { [weak self] response in
            guard let self = self else { return }
            switch self.getResult(response) {
            case .success(let data):
                if let facultyId = self.userDefaults.string(forKey: "facultyId") {
                    self.privateState = .facultySelection(facultyId: facultyId, data: data)
                    return
                }
                self.privateState = .content(data: data)
            case .failure(let error):
                self.privateState = .fail(error: error)
            }
        }
    }
}

extension FacultiesView {
    enum ViewState {
        case loading
        case content(data: [(String, String)])
        case fail(error: Error)
        case facultySelection(facultyId: String, data: [(String, String)])
    }
}
