require "test_helper"

class TicketMailerTest < ActionMailer::TestCase
  test "confirm" do
    ticket = create :ticket
    mail = TicketMailer.confirm(ticket)
    assert_equal [ ticket.user.email ], mail.to
    assert_equal [ ENV.fetch("RAILS_EMAIL_FROM", "partecipo@partecipo.it") ], mail.from
    assert_match ENV.fetch("RAILS_TITLE", "Partecipo"), mail.subject
    assert_match I18n.t("mailer.ticket.confirm.action"), mail.subject
    assert_match I18n.l(ticket.happening.start_at, format: :detailed), mail.subject
    assert_match I18n.t("mailer.generic.hi"), mail.body.encoded
    assert_match ticket.happening.event.title, mail.body.encoded
    assert_match ticket.happening.title, mail.body.encoded
    assert_match I18n.l(ticket.happening.start_at, format: :detailed), mail.body.encoded
  end

  test "deleted" do
    ticket = create :ticket
    mail = TicketMailer.deleted(ticket)
    assert_equal [ ticket.user.email ], mail.to
    assert_equal [ ENV.fetch("RAILS_EMAIL_FROM", "partecipo@partecipo.it") ], mail.from
    assert_match ENV.fetch("RAILS_TITLE", "Partecipo"), mail.subject
    assert_match I18n.t("mailer.ticket.deleted.action"), mail.subject
    assert_match I18n.l(ticket.happening.start_at, format: :detailed), mail.subject
    assert_match I18n.t("mailer.generic.hi"), mail.body.encoded
    assert_match ticket.happening.event.title, mail.body.encoded
    assert_match ticket.happening.title, mail.body.encoded
    assert_match I18n.l(ticket.happening.start_at, format: :detailed), mail.body.encoded
  end

  test "reminder" do
    ticket = create :ticket
    mail = TicketMailer.reminder(ticket.happening, ticket.user)
    assert_equal [ ticket.user.email ], mail.to
    assert_equal [ ENV.fetch("RAILS_EMAIL_FROM", "partecipo@partecipo.it") ], mail.from
    assert_match ENV.fetch("RAILS_TITLE", "Partecipo"), mail.subject
    assert_match I18n.t("mailer.ticket.reminder.action"), mail.subject
    assert_match I18n.l(ticket.happening.start_at, format: :detailed), mail.subject
    assert_match I18n.t("mailer.generic.hi"), mail.body.encoded
    assert_match ticket.happening.event.title, mail.body.encoded
    assert_match ticket.happening.title, mail.body.encoded
    assert_match I18n.l(ticket.happening.start_at, format: :detailed), mail.body.encoded
  end
end
