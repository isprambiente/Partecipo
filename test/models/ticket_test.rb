# frozen_string_literal: true

require "test_helper"

class TicketTest < ActiveSupport::TestCase
  test "valid from factory" do
    ticket = build :ticket
    assert ticket.valid?
    assert ticket.save
  end

  ### Associations
  test "belongs to user" do
    ticket = create :ticket
    assert_instance_of User, ticket.user
  end

  test "belongs to happening" do
    ticket = create :ticket
    assert_instance_of Happening, ticket.happening
  end

  test "has many answers" do
    ticket = create :ticket
    assert_instance_of Answer, ticket.answers.new
  end

  test "accept nested attributes for answers" do
  happening = create :happening
    ticket = create :ticket, happening:, answers_attributes: [ { value: "MyText", question: create(:question, category: :string, happening:) } ]
    assert_equal 1, Ticket.count
    assert_equal 1, ticket.answers.count
  end

  ### Validations
  test "happening must be saleable" do
    t = Time.zone.now
    happening = create :happening, start_at: t + 1.day, start_sale_at: t - 2.days, stop_sale_at: t - 1.day
    ticket = happening.tickets.new user: create(:user)
    assert_not ticket.valid?
    happening.update stop_sale_at: t + 1.day
    assert ticket.valid?
    assert ticket.save
  end

  test "tickets count must be less or equal than max_tickets" do
    happening = create :happening, max_tickets: 2
    assert happening.tickets.create(user: create(:user)).persisted?
    assert happening.tickets.create(user: create(:user)).persisted?
    assert_not happening.tickets.create(user: create(:user)).persisted?
  end

  test "user tickets count must be less or equal than max_tickets_for_user" do
    happening = create :happening, max_tickets_for_user: 1
    user = create :user
    assert happening.tickets.create(user:)
    ticket = happening.tickets.new(user:)
    assert_not ticket.valid?
    happening.update max_tickets_for_user: 2
    assert ticket.valid?
    assert ticket.save
  end

  test "validate single frequency type" do
    event = create :event, tickets_frequency: :single
    user = create :user
    h1 = create(:happening, event:)
    h2 = create(:happening, event:)
    h1.tickets.create(user:)
    t = h2.tickets.new(user:)
    assert_not t.valid?
    event.update tickets_frequency: :any
    assert t.valid?
  end

  test "validate daily frequence type" do
    event = create :event, tickets_frequency: :daily
    user = create :user
    d = Date.tomorrow
    h1 = create :happening, event:, start_at: d
    h2 = create :happening, event:, start_at: d
    h3 = create :happening, event:, start_at: d + 1.day
    t1 = h1.tickets.new(user:)
    t2 = h2.tickets.new(user:)
    t3 = h3.tickets.new(user:)
    assert t1.valid?
    assert t1.save
    assert_not t2.valid?
    assert t3.valid?
    assert t3.save
  end

  test "validate weekly frequence type" do
    event = create :event, tickets_frequency: :weekly
    user = create :user
    d = Date.tomorrow
    h1 = create :happening, event:, start_at: d
    h2 = create :happening, event:, start_at: d + 7
    h3 = create :happening, event:, start_at: d + 8.days
    t1 = h1.tickets.new(user:)
    t2 = h2.tickets.new(user:)
    t3 = h3.tickets.new(user:)
    assert t1.valid?
    assert t1.save
    assert_not t2.valid?
    assert t3.valid?
    assert t3.save
  end

  test "validate monthly frequence type" do
    event = create :event, tickets_frequency: :monthly
    user = create :user
    d = Date.tomorrow
    h1 = create :happening, event:, start_at: d
    h2 = create :happening, event:, start_at: d + 30.days
    h3 = create :happening, event:, start_at: d + 31.days
    t1 = h1.tickets.new(user:)
    t2 = h2.tickets.new(user:)
    t3 = h3.tickets.new(user:)
    assert t1.valid?
    assert t1.save
    assert_not t2.valid?
    assert t3.valid?
    assert t3.save
  end

  test "answer for mandatory question are required" do
    happening = create :happening
    question = create :question, mandatory: true, category: :string, happening: happening
    ticket1 = build :ticket, happening: happening
    assert_not ticket1.valid?
    ticket2 = build :ticket, happening: happening, answers_attributes: [ { value: "ok", question: question } ]
    ticket2.valid?
    assert_equal ticket2.errors.messages, {}
    assert ticket2.save
  end

  test "optional quetion do not qrequire answer" do
    question = create :question, mandatory: false
    ticket = build(:ticket, user: create(:user), happening: question.happening)
    assert ticket.valid?
    assert ticket.save
    ticket.answers_attributes = [ { value: "ok", question: } ]
    assert ticket.valid?
    assert ticket.save
  end

  test "check if all answers are valid" do
    question = create :question, mandatory: true
    ticket = build(:ticket, user: create(:user), happening: question.happening, answers_attributes: [ { value: "", question: } ])
    assert_not ticket.valid?
    ticket.answers.first.value = "ok"
    assert ticket.valid?
    assert ticket.save
  end

  ### Scope
  test "scope with_user" do
    u1 = create :user
    u2 = create :user
    create :ticket, user: u1
    create :ticket, user: u2
    assert_equal 1, Ticket.with_user(u1).count
    assert_equal 1, Ticket.with_user(u2).count
  end

  ### Istance Methods
  test "tickets_count" do
    happening = create :happening
    t1 = create(:ticket, happening:)
    t2 = build(:ticket, happening:)
    assert_equal 1, t1.tickets_count
    assert_equal 2, t2.tickets_count
  end

  test "tickets_for_user_count" do
    happening = create :happening
    user = create :user
    t1 = create(:ticket, happening:, user:)
    t2 = build(:ticket, happening:, user:)
    t3 = create(:ticket, happening:)
    assert_equal 1, t1.tickets_for_user_count
    assert_equal 2, t2.tickets_for_user_count
    assert_equal 1, t3.tickets_for_user_count
  end

  test "missing_ansers return id list of unresponded mandatory question" do
    happening = create(:happening)
    question = create(:question, mandatory: true, happening:)
    ticket = build(:ticket, happening:, user: create(:user))
    assert_equal [ question.id ], ticket.send(:missing_answers)
    ticket.answers_attributes = [ { value: "ok", question: } ]
  end
end
