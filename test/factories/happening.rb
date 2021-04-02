# frozen_string_literal: true

FactoryBot.define do
  factory :happening do
    fact
    detail { 'detail' }
    max_seats { 10 }
    max_seats_for_ticket { 1 }
    start_at { Time.zone.now }
    start_sale_at { Time.zone.now - 1.day }
    stop_sale_at { Time.zone.now + 1.day }
  end
end
