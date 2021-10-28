//
//  unipi_appApp.swift
//  Shared
//
//  Created by Giovanni Catania on 28/10/21.
//

import SwiftUI

@main
struct unipi_appApp: App {
    let persistenceController = PersistenceController.shared

    var body: some Scene {
        WindowGroup {
            FacultiesView()
        }
    }
}
