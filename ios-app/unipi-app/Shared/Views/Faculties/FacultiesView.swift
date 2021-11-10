import SwiftUI

struct FacultiesView: View {
    let careerId: Int
    let userDefaults = UserDefaults.standard
    
    @State var facultyId: String?
    @StateObject var viewModel: FacultiesViewModel = FacultiesViewModel()
    
    var body: some View {
        ZStack {
            FacultiesListView(data: viewModel.data,
                              careerId: careerId,
                              selection: $facultyId)
            LoaderView(isLoading: viewModel.isLoading)
        }
        .alert(item: $viewModel.errorData,
               content: { Alert(data: $0) })
        .navigationTitle("choose your faculty")
        .onChange(of: facultyId, perform: { userDefaults.set($0, forKey: String(careerId)) })
        .onAppear(perform: { viewModel.getFaculties() })
    }
}

struct FacultiesListView: View {
    let data: [Faculty]
    let careerId: Int
    
    @Binding var selection: String?
    
    var body: some View {
        List(data, id: \.identifier) { faculty in
            NavigationLink(destination: MainView(careerId: careerId, facultyId: selection),
                           tag: faculty.identifier,
                           selection: $selection) {
                Text(faculty.name)
            }
        }
    }
}
