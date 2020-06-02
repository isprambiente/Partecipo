# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

text = <<-EOF
 <p>Per limitare il rischio di contagio Covid 19 l'accesso alla mensa sara` possibile unicamente tramite prenotazione.</p>
 <p>Gli accesi alla mensa saranno divisi in tre turni: 12:30, 13:00, 13:30.</p>
 <p>In ogni turno potranno accedere unicamente 30 persone.</p>
EOF

t1 = Time.zone.now.beginning_of_day + 12.hours + 30.minutes
t2 = Time.zone.now.beginning_of_day + 13.hours
t3 = Time.zone.now.beginning_of_day + 13.hours + 30.minutes
f1 = Fact.create(group: Group.first, title: 'Mensa Brancati 60', start_on: Time.zone.today, stop_on: Time.zone.today + 1.month, body: text)
f2 = Fact.create(group: Group.first, title: 'Mensa Brancati 48', start_on: Time.zone.today, stop_on: Time.zone.today + 1.month, body: text)

f1.image.attach io: open(Rails.root.join('db', 'mensa.png')), filename: 'mensa.png', content_type: 'image/png'
(0..30).each do |n|
  f1.happenings.create max_seats: 30, max_seats_for_ticket: 5, start_at: t1 + n.days, start_sale_at: t1 + n.days - 3.days, stop_sale_at: t1 + n.days
  f1.happenings.create max_seats: 30, max_seats_for_ticket: 5, start_at: t2 + n.days, start_sale_at: t2 + n.days - 3.days, stop_sale_at: t2 + n.days
  f1.happenings.create max_seats: 30, max_seats_for_ticket: 5, start_at: t3 + n.days, start_sale_at: t3 + n.days - 3.days, stop_sale_at: t3 + n.days
  f2.happenings.create max_seats: 30, max_seats_for_ticket: 5, start_at: t1 + n.days, start_sale_at: t1 + n.days - 3.days, stop_sale_at: t1 + n.days
  f2.happenings.create max_seats: 30, max_seats_for_ticket: 5, start_at: t2 + n.days, start_sale_at: t2 + n.days - 3.days, stop_sale_at: t2 + n.days
  f2.happenings.create max_seats: 30, max_seats_for_ticket: 5, start_at: t3 + n.days, start_sale_at: t3 + n.days - 3.days, stop_sale_at: t3 + n.days
end
f2.image.attach io: open(Rails.root.join('db', 'mensa.png')), filename: 'mensa.png', content_type: 'image/png'
