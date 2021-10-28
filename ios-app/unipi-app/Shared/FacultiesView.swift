import SwiftUI
import API

struct FacultiesView: View {
    let apiClient = APIClient(baseURL: "https://unipi-api.herokuapp.com")
    let pathsOpRequest = API.PathsOp.Request()
        
    @State var data: [(String, String)] = []
    @State var skip: Bool = false

    let onEntryTap: ((String, String)) -> () -> Void = { element in {
            let defaults = UserDefaults.standard
            defaults.set(element.1, forKey: "facultyId")
            defaults.set(element.0, forKey: "facultyName")
        }
    }

    var body: some View {
        NavigationView {
            List(data, id: \.0) {
                element in
                NavigationLink(destination: CredentialsView()) {
                    Cell(element: element.1)
                }.simultaneousGesture(TapGesture().onEnded(onEntryTap(element)))
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
                print("retrieving paths failed with error '\(apiError)'")
            }
        }}).navigationTitle("Choose your faculty")
    }
}

struct Cell: View {
    let element: String
    
    var body: some View {
        Text(element)
    }
}
