import PageShell from "../components/PageShell";
import { Music, BookOpen, Mic, Heart, Mail, Phone, MapPin } from "lucide-react";

function About() {
  return (
    <PageShell
      title="About Gospel Tube"
      description="Sharing the Good News through inspiring videos, worship music, Bible teachings, and Christian testimonies."
    >
      <div className="max-w-4xl mt-6 space-y-12">
        <section className="bg-white border border-slate-200/80 rounded-3xl p-8 lg:p-10 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
          <p className="text-slate-600 leading-relaxed text-lg">
            Gospel Tube exists to spread the Gospel of Jesus Christ by making
            Christian content available to everyone. Our goal is to encourage,
            inspire, and strengthen believers through faith-filled videos that
            can be watched anytime and anywhere.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">What We Offer</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Music size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Worship Music</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Enjoy uplifting praise and worship from talented Christian artists.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Bible Teachings</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Learn God's Word through inspiring Bible studies and teachings.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Mic size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Sermons</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Watch sermons that encourage spiritual growth and faith.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Heart size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Testimonies</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Hear powerful stories of God's love and transformation.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10 text-center text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Our Foundation</h2>
            <blockquote className="text-2xl lg:text-3xl font-serif italic leading-relaxed mb-6 text-slate-100">
              "Go into all the world and preach the gospel to every creature."
            </blockquote>
            <h3 className="text-red-400 font-bold tracking-wide">— Mark 16:15</h3>
          </div>
        </section>

        <section className="bg-white border border-slate-200/80 rounded-3xl p-8 lg:p-10 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact Us</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center mb-4">
                <Mail size={24} />
              </div>
              <p className="font-bold text-slate-900 mb-1">Email</p>
              <a href="mailto:info@gospeltube.com" className="text-red-600 hover:underline text-sm">info@gospeltube.com</a>
            </div>
            
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center mb-4">
                <Phone size={24} />
              </div>
              <p className="font-bold text-slate-900 mb-1">Phone</p>
              <p className="text-slate-500 text-sm">+263 77 123 4567</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center mb-4">
                <MapPin size={24} />
              </div>
              <p className="font-bold text-slate-900 mb-1">Location</p>
              <p className="text-slate-500 text-sm">Harare, Zimbabwe</p>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

export default About;
