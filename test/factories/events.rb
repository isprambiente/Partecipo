# frozen_string_literal: true

FactoryBot.define do
  factory :event do
    group
    title
    where { "MyString" }
    pinned { false }
    # start_on { Time.zone.now - 1.day }
    # stop_on { Time.zone.now + 1.day }
    tickets_frequency { "any" }
  end
end
