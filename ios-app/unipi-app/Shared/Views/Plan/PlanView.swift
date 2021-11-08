import SwiftUI
import API

struct PlanView: View {
    let careerId: Int
    @ObservedObject var viewModel: PlanViewModel = PlanViewModel()

    @State var data: API.PlanOp.Response.Status200? = nil
    @State var currentError: AlertData?
    @State var isLoading: Bool = false

    let keychain = Keychain()

    var body: some View {
        List(data?.entries ?? [], id: \.name) { element in
            VStack {
                TextView(
                    text: element.name ?? "[unknown]",
                    type: .subtitle_1
                )
                List(element.planEntries ?? [], id: \.code) { entry in
                    TextView(
                        text: entry.code ?? "[no code]",
                        type: .subtitle_2
                    )
                }
            }.contentShape(Rectangle())
        }.padding(8)
            .background(Color.secondary_color).cornerRadius(4)
            .progressView(when: isLoading)
            .alert(item: $currentError,
                   content: { Alert(title: Text($0.title),
                                    message: Text($0.message),
                                    dismissButton: .default(Text("ok"))) })
            .onReceive(viewModel.state,
                       perform: { state in updateState(state) })
            .navigationTitle("plan")
            .navigationViewStyle(StackNavigationViewStyle())
            .onAppear(perform: {
                if data == nil {
                    viewModel.getPlan(
                        token: keychain.accessToken!,
                        careerId: self.careerId
                    )
                }
            })
    }
}

private extension PlanView {
    private func updateState(_ state: PlanView.ViewState) {
        switch state {
        case .idle:
            loading()
        case .loading:
            loading()
        case let .content(data: data):
            content(data: data)
        case let .fail(error: error):
            fail(error: error)
        }
    }

    private func loading() {
        self.isLoading = true
    }
    
    private func idle() {
        self.isLoading = false
    }

    private func content(data: API.PlanOp.Response.Status200) {
        self.isLoading = false
        self.data = data
        self.currentError = nil
    }

    private func fail(error: Error) {
        self.currentError = AlertData(id: error.stringValue,
                                      title: "error",
                                      message: error.stringValue)
        self.isLoading = false
    }
}
