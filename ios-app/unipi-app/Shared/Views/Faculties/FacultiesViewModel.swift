import Foundation
import API

class FacultiesViewModel: ObservableObject {
    let apiClient = APIClient(baseURL: "https://unipi-api.herokuapp.com")
    let userDefaults = UserDefaults.standard

    @Published var isLoading: Bool = false
    @Published var data: [Faculty] = []
    @Published var errorData: AlertData?

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
        isLoading = true
        apiClient.makeRequest(API.PathsOp.Request()) { [weak self] response in
            guard let self = self else { return }
            self.isLoading = false
            switch self.getResult(response) {
            case .success(let data):
                self.data = data.map(Faculty.init)
            case .failure(let error):
                self.errorData = AlertData(error: error)
            }
        }
    }
}

extension Faculty {
    init(_ entry: (String, String)) {
        self.init(identifier: entry.0,
                  name: entry.1)
    }
}
