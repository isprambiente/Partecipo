# frozen_string_literal: true

# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
Fact.destroy_all
Group.destroy_all
g = Group.create title: 'test group'
facts = [
  {title: 'evento uno', start_on: Time.zone.now, stop_on: Time.zone.now + 1.year, group: g},
  {title: 'evento due', start_on: Time.zone.now, stop_on: Time.zone.now + 1.year, group: g}
]
happenings = [
  {start_at: Time.zone.now + 1.day, start_sale_at: Time.zone.now - 2.days, stop_sale_at: Time.zone.now + 1.day, max_seats: 100, max_seats_for_ticket: 5, repeat_for: 10, repeat_in: ['0','1','2','3','4','5','6','7']},
  {start_at: Time.zone.now + 1.day + 2.hour, start_sale_at: Time.zone.now - 2.days, stop_sale_at: Time.zone.now + 1.day, max_seats: 100, max_seats_for_ticket: 5, repeat_for: 10, repeat_in: ['0','1','2','3','4','5','6','7']}
]
Fact.create(facts)
Fact.all.each {|f| f.happenings.create happenings}
