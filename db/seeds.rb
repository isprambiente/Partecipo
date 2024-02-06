# frozen_string_literal: true

# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# generate example groups
g1 = Group.create title: 'Formazione e seminari'
g2 = Group.create title: 'Biblioteca'

# generate example users
u1 = User.create email: 'admin@partecipo.it', password: 'partecipo', confirmed_at: Time.zone.now, admin: true, editor: true, groups: [ g1, g2 ]
u2 = User.create email: 'editor@partecipo.it', password: 'partecipo', confirmed_at: Time.zone.now, editor: true, groups: [ g1, g2 ]
User.create email: 'user@partecipo.it', password: 'partecipo', confirmed_at: Time.zone.now
User.create email: 'andrea.ranaldi@gmail.com', password: 'partecipo', confirmed_at: Time.zone.now

body = '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p> <p>Donec ultrices tincidunt arcu non sodales neque sodales ut. Elementum nisi quis eleifend quam adipiscing vitae. Semper quis lectus nulla at volutpat. Pellentesque elit eget gravida cum.</p>'

# Generate some data Example
e1 = Event.create title: "Seminari ISPRA #{Date.today.year}", where: 'Via Vitaliano Brancati 60, 00156, Roma', pinned: false, tickets_frequency: :'any', group: g1, body: body
[ 'Uso del suolo in Italia', 'Specie aliene invasive e come contenerle', 'Polveri sottili ed inquinanti', 'Progetto Strong Sea Life', 'Progettazione e sistemi di monitoraggio per la mitigazione del rischio idrogeologico' ].each_with_index do |title, delay|
  e1.happenings.create(
    title: title,
    start_at: Time.zone.now + delay.week,
    start_sale_at: Time.zone.now,
    stop_sale_at: Time.zone.now + delay.week,
    max_tickets: 100,
    max_tickets_for_user: 100
  )
end
e2 = Event.create title: "Linee guida su container e virtualizzazione applicativa", where: 'Via Vitaliano Brancati 60, 00156, Roma', pinned: false, tickets_frequency: 'any', group: g1, body: body, single: true
e2.happenings.massive_create(
  from: (Time.zone.now + 1.month).to_date,
  to: (Time.zone.now + 1.month).to_date,
  minutes: %w[720],
  start_sale_before: 31,
  stop_sale_before: 0,
  max_tickets: 100,
  max_tickets_for_user: 100
)
e3 = Event.create title: "Accesso biblioteca ISPRA", where: 'Via Vitaliano Brancati 60, 00156, Roma', pinned: false, tickets_frequency: :daily, group: g2, body: body
e3.happenings.massive_create(
  from: Time.zone.now.yesterday.to_date,
  to: (Time.zone.now + 1.month).to_date,
  minutes: %w[540],
  start_sale_before: 30,
  stop_sale_before: 0,
  max_tickets: 50,
  max_tickets_for_user: 1
)

# u1.update groups: [ g1, g2 ]
# u2.update groups: [ g1, g2 ]
