# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    email
    password { "asdf1234!" }
    confirmed_at { Time.zone.now }
  end
end
