import SwiftUI

struct BookletView: View {
    let careerId: Int
    let keychain = Keychain()
    
    @StateObject var viewModel: BookletViewModel = BookletViewModel()
    
    var body: some View {
        ZStack {
            BookletList(exams: viewModel.data)
            LoaderView(isLoading: viewModel.isLoading)
        }
        .padding(8)
        .background(Color.secondary_color).cornerRadius(4)
        .alert(item: $viewModel.currentError,
               content: { Alert(data: $0) })
        .navigationTitle("booklet")
        .onAppear(perform: {
            if let token = keychain.accessToken {
                viewModel.getBooklet(
                    token: token,
                    careerId: careerId
                )
            }
        })
    }
}

struct BookletList: View {
    let exams: [Exam]
    
    var body: some View {
        List(exams, id:\.code) { exam in
            BookletCell(exam: exam)
        }
    }
}

struct BookletCell: View {
    let exam: Exam
    
    var body: some View {
        HStack {
            BookletStatus(status: exam.status)
            VStack(alignment: .leading, spacing: 6) {
                TextView(text: exam.name, type: .subtitle_1)
                HStack {
                    TextView(text: exam.code, type: .body_2)
                    Spacer()
                    TextView(text: exam.date, type: .body_2)
                        .foregroundColor(Color.text_primary_color)
                }
            }
            .padding(.leading, 4)
            ScoreView(score: exam.score)
            Spacer()
        }
    }
}

struct ScoreView: View {
    let score: String?
    
    var body: some View {
        if let score = score {
            Text(score).padding(6)
                .foregroundColor(.blue)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color.blue, lineWidth: 4)
                ).opacity(0.8).padding(6)
        } else {
            EmptyView()
        }
    }
}

struct BookletStatus: View {
    let status: ExamStatus
    
    var body: some View {
        Image(systemName: getStatusImageSymbol(status).0)
            .foregroundColor(getStatusImageSymbol(status).1)
            .frame(width: 24, height: 24)
            .padding(16)
            .background(Color.primary_color)
            .cornerRadius(4)
    }
    
    func getStatusImageSymbol(_ status: ExamStatus) -> (String, Color) {
        switch status {
        case .planned: return ("bookmark.circle", .blue)
        case .attended: return ("bookmark.circle", .yellow)
        case .passed: return ("bookmark.circle.fill", .green)
        case .unknown: return ("questionmark.app", .gray)
        }
    }
}
