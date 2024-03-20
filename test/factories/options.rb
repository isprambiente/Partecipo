FactoryBot.define do
  factory :option do
    question
    title
    weight { 1 }
    acceptable { true }
  end
end
