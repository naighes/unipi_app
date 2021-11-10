import SwiftUI
import API

struct PlanView: View {
    let careerId: Int
    @StateObject var viewModel: PlanViewModel = PlanViewModel()
    
    let keychain = Keychain()
    
    var body: some View {
        ZStack {
            PlanListView(plans: viewModel.data)
            LoaderView(isLoading: viewModel.isLoading)
        }
        .padding(8)
        .background(Color.secondary_color).cornerRadius(4)
        .alert(item: $viewModel.currentError,
               content: { Alert(data: $0) })
        .navigationTitle("plan")
        .onAppear(perform: {
            viewModel.getPlan(
                token: keychain.accessToken!,
                careerId: self.careerId
            )
        })
    }
}

struct PlanListView: View {
    let plans: [Plan]
    
    var body: some View {
        List(plans, id: \.name) { plan in
            TextView(
                text: plan.name,
                type: .subtitle_1
            )
            Section {
                ForEach(plan.entries, id: \.code) { entry in
                    PlanEntryView(planEntry: entry)
                }
            }
        }
    }
}

struct PlanEntryView: View {
    let planEntry: PlanEntry
    
    var body: some View {
        HStack {
            TextView(
                text: planEntry.code,
                type: .subtitle_2
            )
            TextView(
                text: planEntry.name,
                type: .subtitle_2
            )
        }
    }
}
