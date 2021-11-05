import SwiftUI
import API

struct CareersView: View {
    @ObservedObject var viewModel: CareersViewModel = CareersViewModel()

    @State var data: API.CareersOp.Response.Status200? = nil
    @State var currentError: AlertData?
    @State var isLoading: Bool = false
    @State var careerId: Int? = nil

    let keychain = Keychain()

    @ViewBuilder
    func getDestinationView(_ careerId: Int) -> some View {
        if let facultyId = UserDefaults.standard.string(forKey: String(careerId)) {
            MainView(careerId: careerId, facultyId: facultyId)
        } else {
            FacultiesView(careerId: careerId)
        }
    }

    var body: some View {
        NavigationView {
            ZStack {
                Color.primary_color.edgesIgnoringSafeArea(.all)

                List(data?.entries ?? [], id: \.careerId) { element in
                    HStack {
                        Text(element.name ?? "[unknown]")
                        Text(element.type ?? "[unknown]").font(Font(UIFont.systemFont(ofSize: 13)))
                    }.onTapGesture {
                            self.careerId = element.careerId
                        }
                        .background(
                            NavigationLink(destination: getDestinationView(element.careerId ?? 0),
                                           tag: element.careerId ?? 0,
                                           selection: $careerId) { EmptyView() }
                                .buttonStyle(PlainButtonStyle())
                        )
                        .contentShape(Rectangle())
                }
                .progressView(when: isLoading)
                .alert(item: $currentError,
                       content: { Alert(title: Text($0.title),
                                        message: Text($0.message),
                                        dismissButton: .default(Text("ok"))) })
                .onReceive(viewModel.state,
                           perform: { state in updateState(state) })
                .navigationTitle("choose your career")
                .navigationViewStyle(StackNavigationViewStyle())
            }
        }
        .onAppear(perform: {
            if let token = self.keychain.accessToken {
                viewModel.getCareers(token: token)
            }
        })
    }
}

private extension CareersView {
    private func updateState(_ state: CareersView.ViewState) {
        switch state {
        case .loading:
            loading()
        case let .content(data: data):
            content(data: data)
        case let .fail(error: error):
            fail(error: error)
        case let .careerSelection(careerId: careerId, data: data):
            careerSelection(careerId: careerId, data: data)
        }
    }

    private func loading() {
        self.isLoading = true
    }

    private func content(data: API.CareersOp.Response.Status200) {
        self.data = data
        self.currentError = nil
        self.isLoading = false
    }

    private func fail(error: Error) {
        self.currentError = AlertData(id: error.stringValue,
                                      title: "error",
                                      message: error.stringValue)
        self.isLoading = false
    }

    private func careerSelection(careerId: Int, data: API.CareersOp.Response.Status200) {
        self.data = data
        self.isLoading = false
        self.currentError = nil
    }
}
