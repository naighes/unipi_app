import SwiftUI
import API

struct CareersView: View {
    @StateObject var viewModel: CareersViewModel = CareersViewModel()
    
    let keychain = Keychain()
    
    var body: some View {
        ZStack {
            CareersBackground()
            CareersListView(data: viewModel.data)
            LoaderView(isLoading: viewModel.isLoading)
        }
        .alert(item: $viewModel.currentError,
               content: { Alert(data: $0) })
        .navigationTitle("choose your career")
        .onAppear(perform: {
            if let token = keychain.accessToken {
                viewModel.getCareers(token: token)
            }
        })
    }
}

struct CareersBackground: View {
    var body: some View {
        Color.blue.edgesIgnoringSafeArea(.all)
    }
}

struct CareersListView: View {
    let data: [Career]
    
    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading) {
                ForEach(data, id: \.identifier) { career in
                    NavigationLink(destination: getDestinationView(career.identifier)){
                        HStack {
                            Text(career.name).foregroundColor(.white)
                            Text(career.type).font(Font(UIFont.systemFont(ofSize: 13))).foregroundColor(.white)
                        }
                    }
                    Divider()
                }
            }.padding(16)
        }
    }
    
    @ViewBuilder
    func getDestinationView(_ careerId: Int) -> some View {
        if let facultyId = UserDefaults.standard.string(forKey: String(careerId)) {
            MainView(careerId: careerId, facultyId: facultyId)
        } else {
            FacultiesView(careerId: careerId)
        }
    }
}


struct CareersView_Previews: PreviewProvider {
    static var previews: some View {
        let viewModel = CareersViewModel()
        viewModel.data = [.init(name: "Informatica", identifier: 0, type: "Magistrale")]
        return CareersView(viewModel: viewModel)
    }
}
