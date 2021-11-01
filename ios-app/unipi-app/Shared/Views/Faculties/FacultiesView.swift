import SwiftUI
import API

struct FacultiesView: View {
    @ObservedObject var viewModel: FacultiesViewModel = FacultiesViewModel()
        
    @State var data: [(String, String)] = []
    @State var currentError: AlertData?
    @State var skipView: Bool = false
    @State var isLoading: Bool = false

    var body: some View {
        NavigationView {
            List(data, id: \.0) { element in
                NavigationLink(element.1,
                               destination: CredentialsView(facultyId: element.0),
                               isActive: $skipView)
                    .contentShape(Rectangle())
            }
            .progressView(when: isLoading)
            .alert(item: $currentError,
                   content: { Alert(title: Text($0.title),
                                    message: Text($0.message),
                                    dismissButton: .default(Text("Ok"))) })
            .onReceive(viewModel.state,
                       perform: { state in updateState(state) })
            .navigationTitle("choose your faculty")
            .navigationViewStyle(StackNavigationViewStyle())
        }
        .onAppear(perform: { viewModel.getFaculties() })
    }
}

private extension FacultiesView {
    private func updateState(_ state: FacultiesView.ViewState) {
        switch state {
        case .loading:
            loading()
        case let .content(data: data):
            content(data: data)
        case let .fail(error: error):
            fail(error: error)
        case let .facultySelection(facultyId: facultyId, data: data):
            facultySelection(facultyId: facultyId, data: data)
        }
    }
    
    private func loading() {
        self.skipView = false
        self.isLoading = true
    }
    
    private func content(data: [(String, String)]) {
        self.data = data
        self.currentError = nil
        self.skipView = false
        self.isLoading = false
    }
    
    private func fail(error: Error) {
        self.currentError = AlertData(id: error.stringValue,
                                      title: "Error",
                                      message: error.stringValue)
        self.skipView = false
        self.isLoading = false
    }
    
    private func facultySelection(facultyId: String, data: [(String, String)]) {
        self.skipView = true
        self.isLoading = false
        self.data = data
        self.currentError = nil
    }
}
