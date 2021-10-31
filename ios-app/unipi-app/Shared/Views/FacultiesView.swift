import SwiftUI
import API

struct FacultiesView: View {
    let apiClient = APIClient(baseURL: "https://unipi-api.herokuapp.com")
        
    @State var data: [(String, String)] = []
    @State var currentError: Error?

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

    var body: some View {
        NavigationView {
            List(data, id: \.0) { element in
                NavigationLink(destination: CredentialsView(facultyId: element.0)) {
                    Text(element.1)
                }
                .contentShape(Rectangle())
            }.onAppear(perform: { apiClient.makeRequest(API.PathsOp.Request()) {
                response in
                switch getResult(response) {
                case .success(let data):
                    self.data = data
                case .failure(let error):
                    self.currentError = error
                }
            }}).navigationTitle("choose your faculty")
            if let error = currentError {
                Text("\(error)" as String)
            }
        }
    }
}
