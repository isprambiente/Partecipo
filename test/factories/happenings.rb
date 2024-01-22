# frozen_string_literal: true

FactoryBot.define do
  factory :happening do
    event
    title { "optional happening title" }
    start_at { Time.zone.now + 1.day }
    start_sale_at { Time.zone.now - 1.day }
    stop_sale_at { Time.zone.now + 1.day }
    max_tickets { 10 }
    max_tickets_for_user { 1 }
  end
end
