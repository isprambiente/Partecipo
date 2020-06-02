# frozen_string_literal: true

FactoryBot.define do
  factory :ticket do
    happening
    user
    seats { 1 }
  end
end
