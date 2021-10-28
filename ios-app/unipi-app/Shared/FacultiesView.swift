//
//  FacultiesView.swift
//  unipi-app
//
//  Created by Giovanni Catania on 28/10/21.
//

import SwiftUI
import API

struct FacultiesView: View {
    let apiClient = APIClient(baseURL: "https://unipi-api.herokuapp.com")
    let getPathsRequest = API.PathsOp.Request()
        
    @State var data: [(String, String)] = []
    
    var body: some View {
        List(data, id: \.0) { element in
            Cell(element: element.1)
                .onTapGesture {
                    print("tapped: \(element.1)")
            }
        }.onAppear(perform: { apiClient.makeRequest(getPathsRequest) { response in
                
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
            }
            })
    }
}

struct Cell: View {
    let element: String
    
    var body: some View {
        Text(element)
    }
}
