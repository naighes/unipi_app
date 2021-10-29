import SwiftUI
import API

struct FacultiesView: View {
    let apiClient = APIClient(baseURL: "https://unipi-api.herokuapp.com")
        
    @State var data: [(String, String)] = []

    let getResult: (APIResponse<API.PathsOp.Response>) -> [(String, String)] = {
        response in
        switch response.result {
        case let .success(v):
            switch v {
            case let .status200(paths):
                return paths.reduce([], { $0 + [($1.key, $1.value)] }).sorted {
                    $0.1 < $1.1
                }
            default:
                print("unexpected status code")
                return []
            }
        case let .failure(e):
            print("retrieving paths failed with error '\(e)'")
            return []
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
                data = getResult(response)
            }}).navigationTitle("choose your faculty")
        }
    }
}
