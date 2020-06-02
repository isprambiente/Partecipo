# frozen_string_literal: true

FactoryBot.define do
  factory :fact do
    group
    title
    where { 'where?' }
    pinned { false }
    start_on { Time.zone.today - 1.day }
    stop_on { Time.zone.today + 1.day }
  end
end
