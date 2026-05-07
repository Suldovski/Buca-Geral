using Google.Cloud.Firestore;
using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;

namespace BucaGeral.Api.Services;

public class FirebaseService
{
    private readonly FirestoreDb _firestore;
    private readonly FirebaseAuth _auth;
    
    public FirebaseService(IConfiguration configuration)
    {
        var credentialPath = configuration["Firebase:CredentialPath"] ?? "firebase-adminsdk.json";
        var fullPath = Path.Combine(Directory.GetCurrentDirectory(), credentialPath);
        
        var credential = GoogleCredential.FromFile(fullPath);
        
        if (FirebaseApp.DefaultInstance == null)
        {
            FirebaseApp.Create(new AppOptions
            {
                Credential = credential
            });
        }
        
        _auth = FirebaseAuth.DefaultInstance;
        
        var projectId = configuration["Firebase:ProjectId"] ?? "buca-geral";
        _firestore = new FirestoreDbBuilder
        {
            ProjectId = projectId,
            Credential = credential
        }.Build();
    }
    
    public FirestoreDb GetFirestore() => _firestore;
    public FirebaseAuth GetAuth() => _auth;
}
