# frozen_string_literal: true

FactoryBot.define do
  sequence(:title)     { |n| "title_#{n}" }
  sequence(:username)  { |n| "user_#{n}" }
end
