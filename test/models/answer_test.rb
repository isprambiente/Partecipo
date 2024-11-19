require "test_helper"

class AnswerTest < ActiveSupport::TestCase
  ### Valid from factory
  test "valid from factory with string" do
    ticket = create :ticket_answer_string
    assert ticket.answers.first.valid?
  end

  test "valid from factory with text" do
    ticket = create :ticket_answer_text
    assert ticket.answers.first.valid?
  end

  test "valid from factory with file" do
    ticket = create :ticket_answer_file
    assert ticket.answers.first.valid?
  end
  test "valid from factory with select" do
    ticket = create :ticket_answer_select
    assert ticket.answers.first.valid?
  end

  ### Associations
  test "belongs from ticket" do
    ticket = create :ticket_answer_string
    assert_instance_of Ticket, ticket.answers.first.ticket
  end

  test "belongs from question" do
    ticket = create :ticket_answer_string
    assert_instance_of Question, ticket.answers.first.question
  end

  test "have file as activestorage, one, relation" do
    answer = Answer.new
    assert_instance_of ActiveStorage::Attached::One, answer.file
  end

  ### validation
  test "a ticket can be have only an answer for question" do
    happening = create :happening
    question = create :question, happening:, mandatory: false
    ticket =  create(:ticket, happening:)
    answer = build :answer, ticket:, question:, value: "ok"
    assert answer.valid?
    assert answer.save
    answer2 = build :answer, ticket:, question:, value: "no"
    assert_not answer2.valid?
  end

  test "question and ticket must be linked to same happening" do
    happening1 = create :happening
    happening2 = create :happening
    question1 = create :question, happening: happening1, mandatory: false
    question2 = create :question, happening: happening2, mandatory: false
    ticket = create :ticket, happening: happening1
    answer = build :answer, ticket:, question: question2, value: "ok"
    assert_not answer.valid?
    answer.question = question1
    assert answer.valid?
    assert answer.save
  end

  test "file must be present if category is file and is mandatory" do
    happening = create :happening
    question = create :question, happening:, mandatory: true, category: :file
    ticket1 = build(:ticket, happening:)
    assert_not ticket1.valid?
    ticket2 = build(:ticket, happening:, answers_attributes: [ { question: } ])
    assert_not ticket2.valid?
    ticket3 = build(:ticket, happening:, answers_attributes: [ { question:, file: Rack::Test::UploadedFile.new("test/fixtures/files/Ruby_on_Rails-logo.png", "image/png") } ])
    assert ticket3.valid?
    assert ticket3.save
  end

  test "value must not be present if category is file" do
    happening = create :happening
    question = create :question, happening:, category: :file
    ticket1 = build(:ticket, happening:, answers_attributes: [ { question:, value: "no!", file: Rack::Test::UploadedFile.new("test/fixtures/files/Ruby_on_Rails-logo.png", "image/png") } ])
    assert_not ticket1.valid?
    ticket2 = build(:ticket, happening:, answers_attributes: [ { question:, value: "", file: Rack::Test::UploadedFile.new("test/fixtures/files/Ruby_on_Rails-logo.png", "image/png") } ])
    assert ticket2.valid?
    assert ticket2.save
  end

  test "value must be present if mandatory and unless category is file" do
    happening = create :happening
    question = create :question, happening:, category: :string, mandatory: true
    ticket1 = build :ticket, happening:, answers_attributes: [ { question:, value: "" } ]
    assert_not ticket1.valid?
    assert_not ticket1.save
    ticket2 = build :ticket, happening:, answers_attributes: [ { question:, value: "ok" } ]
    assert ticket2.valid?
    assert ticket2.save
  end

  test "Value must be included in options if category is select" do
    happening = create :happening
    question = create(:question, category: :select, options_attributes: [ { title: "ok" } ], happening:, mandatory: true)
    ticket1 = build :ticket, happening:, answers_attributes: [ { question:, value: "" } ]
    assert_not ticket1.valid?
    assert_not ticket1.save
    ticket2 = build :ticket, happening:, answers_attributes: [ { question:, value: "no" } ]
    assert_not ticket2.valid?
    assert_not ticket2.save
    ticket3 = build :ticket, happening:, answers_attributes: [ { question:, value: "ok" } ]
    assert ticket3.valid?
    assert ticket3.save
  end
end
