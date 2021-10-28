import SwiftUI
import API

struct FacultiesView: View {
    let apiClient = APIClient(baseURL: "https://unipi-api.herokuapp.com")
    let pathsOpRequest = API.PathsOp.Request()
        
    @State var data: [(String, String)] = []
    
    var body: some View {
        List(data, id: \.0) { element in
            Cell(element: element.1)
                .onTapGesture {
                    let defaults = UserDefaults.standard
                    defaults.set(element.1, forKey: "facultyId")
                    defaults.set(element.0, forKey: "facultyName")

                    // TODO: ensure selection is not missing
                    // TODO: feedback to user
                    // TODO: go to the next view (type user credentials)
                }
        }.onAppear(perform: { apiClient.makeRequest(pathsOpRequest) {
            response in
            switch response.result {        
            case let .success(apiResponseValue):
                switch apiResponseValue {
                case let .status200(paths):
                    data = paths.reduce([], { $0 + [($1.key, $1.value)] })
                default:
                    print("unexpected status code")
                }
            case let .failure(apiError):
                print("GetPaths failed with \(apiError)")
            }
        }})
    }
}

struct Cell: View {
    let element: String
    
    var body: some View {
        Text(element)
    }
}
