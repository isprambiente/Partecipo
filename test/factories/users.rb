# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    email
    name { "Mario" }
    surname { "Rossi" }
    password { "asdf1234!" }
    confirmed_at { Time.zone.now }
  end
end
